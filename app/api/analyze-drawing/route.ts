import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import supabase from '@/lib/supabase'
import { exercises } from '@/lib/exercises'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  const { image, studentId, classroomId } = await req.json()

  // Get current exercise for the classroom
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('current_exercise')
    .eq('id', classroomId)
    .single()

  const exercise = exercises.find(ex => ex.id === classroom.current_exercise)
  if (!exercise) {
    return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
  }

  // Analyze with OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: "Analyze this drawing and check if it meets these criteria:\n" + 
                  exercise.validationRules.map(rule => rule.check).join("\n")
          },
          { 
            type: "image_url", 
            image_url: image 
          }
        ],
      },
    ],
  })

  // Parse OpenAI response and calculate score
  const analysis = JSON.parse(response.choices[0].message.content)
  
  return NextResponse.json({
    exerciseId: exercise.id,
    score: analysis.passedChecks,
    total: exercise.validationRules.length,
    details: analysis.details
  })
} 