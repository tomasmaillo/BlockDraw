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
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    // Convert blob to base64 for OpenAI API
    const imageBase64 = Buffer.from(await image.arrayBuffer()).toString(
      'base64'
    )
    const imageUrl = `data:image/png;base64,${imageBase64}`

    // Analyze with OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                'Analyze this drawing. For each of the following criteria, check if the drawing meets the criteria:\n' +
                exercise.validationRules.map((rule) => rule.check).join('\n') +
                '\n\nReturn a series of TRUE or FALSE values for each of the criteria. Separate each value with a space.'
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

    console.log('Analysis result:', analysis)

    const passedChecks = analysis?.split(' ').filter(Boolean)
    const total = exercise.validationRules.length
    const score = passedChecks?.length ? passedChecks.length / total : 0

    return NextResponse.json({
      exerciseId: exercise.id,
      score: score,
      total: total,
      details: analysis,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze drawing' },
      { status: 500 }
    )
  }
}
