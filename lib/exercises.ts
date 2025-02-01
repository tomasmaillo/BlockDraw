import { v4 as uuidv4 } from 'uuid'

export interface Exercise {
  id: string
  name: string
  instructions: string[]
  validationRules: Array<{
    check: string
    // ... other validation rule properties
  }>
}

export const exercises: Exercise[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Basic Shapes',
    instructions: ['Draw a circle', 'Draw a square'],
    validationRules: [
      { check: 'Check if there is a circular shape' },
      { check: 'Check if there is a rectangular shape' }
    ]
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174000',
    name: 'Advanced Shapes',
    instructions: ['Draw a triangle', 'Draw a star'],
    validationRules: [
      { check: 'Check if there is a triangular shape' },
      { check: 'Check if there is a star shape' }
    ]
  },
  {
    id: '323e4567-e89b-12d3-a456-426614174000',
    name: 'Draw a Snowman ⛄',
    instructions: [
      'Start at the top of the screen',
      'Change pen color to black',
      {
        type: 'repeat',
        content: 'Repeat (3)',
        children: [
          'Start below the previous circle',
          'Draw a circle [icon:circle] larger than the previous one',
          {
            type: 'if',
            content: 'If this is the 1st circle added:',
            children: [
              'Draw two dots inside the circle',
              'Change pen color to orange',
              'Draw a triangle [icon:triangle] inside the circle',
              'Change pen color to black',
            ]
          },
          {
            type: 'if',
            content: 'If this is the 2nd circle added:',
            children: [
              'Change pen color to brown',
              'Draw 2 lines [icon:line] pointing out of the circle on the left and right',
              'Change pen color to black',
            ]
          }
        ]
      }
    ],
    validationRules: [
      {
        check: 'The image should contain 3 circles arranged vertically from top to bottom, with each circle being larger than the one above it'
      },
      {
        check: 'The top circle should contain two black dots for eyes and an orange triangle for a nose'
      },
      {
        check: 'The middle circle should have two brown lines extending outward horizontally from its sides'
      }
    ]
  },
  {
    id: '423e4567-e89b-12d3-a456-426614174000',
    name: 'Draw a House 🏠',
    instructions: [
      'Draw a square for the base',
      'Draw a triangle on top for the roof',
      'Add a rectangle for the door',
      'Add two squares for windows',
      'Draw a chimney on the roof'
    ],
    validationRules: [
      {
        description: 'Has basic house shape',
        check: 'The image should contain a square/rectangle base with a triangle on top forming a roof'
      },
      {
        description: 'Has door',
        check: 'There should be a rectangular door in the base of the house'
      },
      {
        description: 'Has windows',
        check: 'There should be at least two square/rectangular windows in the house'
      },
      {
        description: 'Has chimney',
        check: 'There should be a rectangular chimney on the sloped roof'
      }
    ]
  }
] 