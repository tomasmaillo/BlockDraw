export type Exercise = {
  id: string
  name: string
  instructions: string[]
  validationRules: {
    description: string
    check: string
  }[]
}

export const exercises: Exercise[] = [
  {
    id: 'snowman',
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
        description: 'Has 3 circles stacked vertically',
        check: 'The image should contain 3 circles arranged vertically from top to bottom, with each circle being larger than the one above it'
      },
      {
        description: 'Has face features',
        check: 'The top circle should contain two black dots for eyes and an orange triangle for a nose'
      },
      {
        description: 'Has arms',
        check: 'The middle circle should have two brown lines extending outward horizontally from its sides'
      }
    ]
  },
  {
    id: 'house',
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