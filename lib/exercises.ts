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
    name: 'Practice Round',
    instructions: [
      'Start at the bottom of the screen',
      'Change pen color to green',
      'Draw a triangle [icon:triangle]',
      {
        type: 'repeat',
        content: 'Repeat (2)',
        children: [
          'Move up from the previous shape',
          'Draw a triangle [icon:triangle] smaller than the previous one',
        ]
      }
    ],
    validationRules: [
      { check: 'Check there are 3 triangles' },
      { check: 'Check the triangles are smaller than the previous one' },
      { check: 'Check the triangles are green' },
      { check: 'Check the triangles are stacked vertically' },
    ],
    shortRules: [
      '3 triangles',
      'Triangles decrease in size',
      'Triangles are green',
      'Triangles are stacked vertically',
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
        check: 'The top circle should contain two black dots for eyes'
      },
      {
        check: 'The top circle should contain an orange triangle for a nose'
      },
      {
        check: 'The middle circle should have two brown lines extending outward horizontally from its sides'
      }
    ],
    shortRules: [
      '3 circles of increasing size',
      '2 black eyes',
      '1 orange nose',
      'Brown stick arms',
    ]
  },

    

  {
    id: '423e4567-e89b-12d3-a456-426614174000',
    name: 'Draw a House 🏠',
    instructions: [
        {
          type: 'motion',
          content: 'Start near the bottom of the screen',
          children: [
            '',
          ]
        },
        
        'Change pen color to black',
      
        {
          type: 'repeat',
          content: 'Repeat (3)',
          children: [
            {
              type: 'motion',
              content: 'Move up a little from the previous shape',
            },
            'Draw a circle [icon:circle] larger than the last one',
            {
              type: 'if',
              content: 'If this is the 1st circle added:',
              children: [
                'Change pen color to brown',
                'Draw a rectangle [icon:rectangle] attached below the circle',
                'Change pen color to black',
              ]
            },
            {
              type: 'if',
              content: 'If this is the 2nd circle added:',
              children: [
                'Change pen color to red',
                'Draw 3 small circles [icon:circle] around the big circle',
                'Change pen color to black',
              ]
            }
          ]
        }
    
      
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