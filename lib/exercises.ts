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
    name: 'Draw a Flower 🌸',
    instructions: [
      'Start at the bottom of the screen',
      'Change pen color to green',
      'Draw a line [icon:line] pointing up',
      'Change pen color to orange',
      'Draw a circle [icon:circle]',
      'Change pen color to blue',
      {
        type: 'repeat',
        content: 'Repeat (6)',
        children: [
          {
            type: 'if',
            content: 'If the repeat number is divisible by 2:',
            children: [
              'Change pen color to red',
              'Draw an oval [icon:circle] coming out of the circle',
          
            ]
          },
          {
            type: 'if',
            content: 'Else:',
            children: [
              'Change pen color to blue',
              'draw an oval [icon:circle] coming out of the circle'
            ]
          },
          'Rotate 60 degrees clockwise around the circle'
        ]
      }
    ],
    validationRules: [
      { check: 'Check there is one green vertical line for the stem' },
      { check: 'Check there is an orange circle above the stem' },
      { check: 'Check there are exactly 6 petals arranged in a circular pattern around the circle' },
      { check: 'Check that alternating petals are red and blue' },
      { check: 'Check that the petals are fairly evenly spaced around the circle(60 degrees apart)' }
    ],
    shortRules: [
      'Green stem',
      'Orange circle',
      '6 petals',
      'Alternating red and blue petals',
    ]
  }

] 