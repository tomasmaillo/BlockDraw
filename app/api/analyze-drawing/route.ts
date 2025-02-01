import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import supabase from '@/lib/supabase'
import { exercises } from '@/lib/exercises'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const image = formData.get('image') as Blob
    const classroomId = formData.get('classroomId') as string

    // Debug logging
    console.log('Received request:', {
      hasImage: !!image,
      imageType: image?.type,
      imageSize: image?.size,
      classroomId
    })

    if (!image || !classroomId) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: {
            image: !!image,
            classroomId: !!classroomId
          }
        }, 
        { status: 400 }
      )
    }

    // Get current exercise for the classroom
    const { data: classroom, error } = await supabase
      .from('classrooms')
      .select('current_exercise_id')
      .eq('id', classroomId)
      .single()

    if (error || !classroom) {
      console.error('Classroom fetch error:', error)
      return NextResponse.json(
        { error: 'Classroom not found or database error' },
        { status: 404 }
      )
    }

    if (!classroom.current_exercise_id) {
      return NextResponse.json(
        { error: 'No exercise selected for this classroom' },
        { status: 400 }
      )
    }

    const exercise = exercises.find(
      (ex) => ex.id === classroom.current_exercise_id
    )
    if (!exercise) {
      console.log('Current exercise ID:', classroom.current_exercise_id);
      console.log('Available exercise IDs:', exercises.map(ex => ex.id));
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    console.log('Found exercise:', exercise);

    // Convert blob to base64 for OpenAI API
    const imageBase64 = Buffer.from(await image.arrayBuffer()).toString(
      'base64'
    )
    const imageUrl = `data:image/png;base64,${imageBase64}`

    // Analyze with OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                'Analyze this drawing. For each of the following criteria, check if the drawing meets the criteria:\n' +
                exercise.validationRules.map((rule) => rule.check).join('\n') +
                '\n\nThese are human drawings (e.g if a circle is not perfect, still return TRUE). Return a series of TRUE or FALSE values for each of the criteria. Separate each value with a space.'
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
    })

    // Parse OpenAI response and calculate score
    const analysis = response.choices[0].message.content
    const checks = analysis?.split(' ').filter(Boolean) || []

    // Map the checks to validation rules, but use shortRules for display
    const validationResults = checks.map((check, index) => ({
      rule: exercise.shortRules[index],
      passed: check.toUpperCase() === 'TRUE'
    }))

    return NextResponse.json({
      exerciseId: exercise.id,
      score: checks.filter(c => c.toUpperCase() === 'TRUE').length,
      total: exercise.validationRules.length,
      validationResults
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze drawing' },
      { status: 500 }
    )
  }
}
