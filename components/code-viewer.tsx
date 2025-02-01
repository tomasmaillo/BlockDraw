import React from 'react';
import { Circle, Triangle, Slash, ArrowRight, RotateCw, MousePointer, Settings, Play, Repeat, Heart, Square, ChevronUp, ChevronDown, ChevronRight, ChevronLeft, Pen, Search } from 'lucide-react';

const Block = ({ content, type, nested, children }: { content: string, type: string, nested: boolean, children: React.ReactNode }) => {
  const blockStyles = {
    motion: 'bg-blue-500',
    repeat: 'bg-green-500',
    looks: 'bg-purple-500',
    variables: 'bg-red-500',
    operators: 'bg-green-500',
    events: 'bg-yellow-500',
    pen: 'bg-pink-500',
    if: 'bg-orange-500',
    draw: 'bg-purple-500',
  };

  const getIcon = (type) => {
    switch (type) {
      case 'motion': return <ArrowRight className="w-5 h-5" />;
      case 'repeat': return <RotateCw className="w-5 h-5" />;
      case 'events': return <MousePointer className="w-5 h-5" />;
      case 'variables': return <Settings className="w-5 h-5" />;
      case 'pen': return <Pen className="w-5 h-5" />;
      case 'if': return <Search className="w-5 h-5" />;
      case 'draw': return <Pen className="w-5 h-5" />;
      default: return <Pen className="w-5 h-5" />;
    }
  };

  const getShapeIcon = (shape) => {
    switch (shape.toLowerCase()) {
      case 'circle': return <Circle className="w-5 h-5" />;
      case 'triangle': return <Triangle className="w-5 h-5" />;
      case 'line': return <Slash className="w-5 h-5" />;
      case 'square': return <Square className="w-5 h-5" />;
      case 'up': return <ChevronUp className="w-5 h-5" />;
      case 'down': return <ChevronDown className="w-5 h-5" />;
      case 'left': return <ChevronLeft className="w-5 h-5" />;
      case 'right': return <ChevronRight className="w-5 h-5" />;
      default: return null;
    }
  };

  const parseContent = (text) => {
    const parts = [];
    let currentText = '';

    // Split the text by icon markers
    const segments = text.split(/(\[icon:[^\]]+\])/);
    
    segments.forEach(segment => {
      if (segment.startsWith('[icon:')) {
        // Extract icon name from [icon:name]
        const iconName = segment.slice(6, -1);
        if (currentText) {
          parts.push({ type: 'text', content: currentText });
          currentText = '';
        }
        parts.push({ type: 'icon', content: iconName });
      } else {
        // Process regular text for other brackets
        let inBracket = false;
        let bracketContent = '';
        let bracketType = '';
        
        for (let i = 0; i < segment.length; i++) {
          const char = segment[i];
          
          if (char === '(' || char === '[' || char === '<') {
            if (currentText) parts.push({ type: 'text', content: currentText });
            currentText = '';
            inBracket = true;
            bracketType = char === '(' ? 'number' : char === '[' ? 'string' : 'boolean';
            continue;
          }
          
          if ((char === ')' || char === ']' || char === '>') && inBracket) {
            parts.push({ type: 'bracket', content: bracketContent.trim(), bracketType });
            bracketContent = '';
            inBracket = false;
            continue;
          }
          
          if (inBracket) {
            bracketContent += char;
          } else {
            currentText += char;
          }
        }
      }
    });

    if (currentText) {
      // Process any remaining text for colors
      const colorMap = {
        black: '#000000',
        brown: '#8B4513',
        orange: '#FFA500',
        red: '#FF0000',
        blue: '#0000FF',
        green: '#008000',
        yellow: '#FFD700',
        purple: '#800080',
        white: '#FFFFFF',
      };
      
      const regex = new RegExp(`\\b(${Object.keys(colorMap).join('|')})\\b`, 'g');
      let lastIndex = 0;
      let match;
      
      while ((match = regex.exec(currentText)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ type: 'text', content: currentText.slice(lastIndex, match.index) });
        }
        
        parts.push({ type: 'text', content: match[0] });
        parts.push({ type: 'color', content: colorMap[match[0].toLowerCase()] });
        
        lastIndex = match.index + match[0].length;
      }
      
      if (lastIndex < currentText.length) {
        parts.push({ type: 'text', content: currentText.slice(lastIndex) });
      }
    }

    return parts;
  };

  return (
    <div className={`
      relative 
      -mb-3
    `}>
      {/* Main block */}
      <div className={`
        ${blockStyles[type] || 'bg-gray-500'} 
        rounded-md p-3 text-white font-medium shadow-md
        flex items-center gap-2
        relative
        w-fit
        ${children ? 'rounded-b-none border-b-0' : ''}
        border border-black/20
        
        /* Top notch - made wider and more rounded */
        before:content-[''] 
        before:absolute before:left-3 before:-top-3
        before:w-8 before:h-3 before:bg-inherit 
        before:rounded-t-md
        before:border-t before:border-l before:border-r before:border-black/20
        
        /* Bottom notch - made wider and more rounded */
        ${!children ? `
          after:content-['']
          after:absolute after:left-3 after:-bottom-3
          after:w-8 after:h-3 after:bg-inherit
          after:rounded-b-md
          after:border-b after:border-l after:border-r after:border-black/20
        ` : ''}
        
        /* Spacing */
        mt-3
      `}>
        {getIcon(type)}
        {parseContent(content).map((part, idx) => {
          if (part.type === 'bracket') {
            const bgColor = part.bracketType === 'number' ? 'bg-white' 
              : part.bracketType === 'string' ? 'bg-blue-200'
              : 'bg-green-200';
            return (
              <span key={idx} className={`${bgColor} rounded px-2 py-1 text-black text-sm`}>
                {part.content}
              </span>
            );
          }
          if (part.type === 'icon') {
            return <span key={idx} className="">{getShapeIcon(part.content)}</span>;
          }
          if (part.type === 'color') {
            return (
              <span 
                key={idx} 
                className="inline-block w-4 h-4 rounded-full ml-1" 
                style={{ backgroundColor: part.content }}
              />
            );
          }
          return <span key={idx}>{part.content}</span>;
        })}
      </div>

      {/* Nested blocks container for C-blocks */}
      {children && (type === 'repeat' || type === 'if') && (
        <div className="relative -mt-3 border-1">
          {/* C-block wrapper - adjusted width to match notch width */}
          <div className={`
            absolute left-0 top-0 bottom-0
            w-14 
            border-l border-b border-black/20
            rounded-bl-md
            ${blockStyles[type] || 'border-gray-500'}
          `} />
          {/* Nested content container - adjusted margin to match new width */}
          <div className="ml-14 pb-3">
            {children}
          </div>
          {/* Closing notch for nested blocks */}
          <div className={`
            w-3/4 h-10
            rounded-md
            border border-black/20
            ${blockStyles[type] || 'border-gray-500'}
          `}/>
        </div>
      )}
    </div>
  );
};


const ScratchInstructions = ({ instructions }) => {
  const renderInstructions = (instr) => {
    if (typeof instr === 'string') {
      return <Block content={instr} type={getBlockType(instr)} nested={false} />;
    }

    if (instr.type === 'repeat' || instr.type === 'if') {
      return (
        <Block content={instr.content} type={instr.type} nested={true}>
          {instr.children.map((child, idx) => (
            <div key={idx}>{renderInstructions(child)}</div>
          ))}
        </Block>
      );
    }

    return <Block content={instr.content} type={instr.type} nested={false} />;
  };

  const getBlockType = (content) => {
    if (content.includes('draw')) return 'draw';
    if (content.includes('set')) return 'variables';
    if (content.includes('repeat')) return 'repeat';
    if (content.includes('if')) return 'if';
    if (content.includes('touching')) return 'events';
    if (content.includes('pen') || content.includes('color')) return 'pen';
    return 'looks';
  };

  return (
    <div className="p-6 bg-gray-100 rounded-xl">
      <h2 className="text-xl font-bold mb-4">Drawing Instructions</h2>
      <div className="space-y-1">
        {instructions.map((instr, idx) => (
          <div key={idx}>{renderInstructions(instr)}</div>
        ))}
      </div>
    </div>
  );
};

// Example usage with more visual instructions
// Example usage with more visual instructions
const App = () => {
  const snowmanInstructions = [
    {
      type: 'motion',
      content: 'Start at the top of the screen',
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
          content: 'Start below the previous circle',
        },
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
  ];


  const treeInstructions = [
    {
      type: 'motion',
      content: 'Move to the bottom center of the screen',
    },
    'Change pen color to brown',
    
    {
      type: 'motion',
      content: 'Draw a rectangle [icon:rectangle]',
    },
  
    {
      type: 'motion',
      content: 'Move above the rectangle',
    },
  
    'Change pen color to green',
  
    {
      type: 'repeat',
      content: 'Repeat (3)',
      children: [
        {
          type: 'motion',
          content: 'Draw a triangle [icon:triangle] wider than the previous one',
        },
        {
          type: 'motion',
          content: 'Move slightly up',
        },
      ],
    },
  ];

 
  

  return <ScratchInstructions instructions={snowmanInstructions} />;
};

export default App;
