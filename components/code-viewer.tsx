import React from 'react';
import { Circle, Triangle, ArrowRight, RotateCw, MousePointer, Settings, Play, Repeat, Heart, Square, ChevronUp, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';

const Block = ({ content, type, nested, children }: { content: string, type: string, nested: boolean, children: React.ReactNode }) => {
  const blockStyles = {
    motion: 'bg-blue-500',
    control: 'bg-orange-500',
    looks: 'bg-purple-500',
    variables: 'bg-red-500',
    operators: 'bg-green-500',
    events: 'bg-yellow-500',
  };

  const getIcon = (type) => {
    switch (type) {
      case 'motion': return <ArrowRight className="w-5 h-5" />;
      case 'control': return <RotateCw className="w-5 h-5" />;
      case 'events': return <MousePointer className="w-5 h-5" />;
      case 'variables': return <Settings className="w-5 h-5" />;
      case 'repeat': return <Repeat className="w-5 h-5" />;
      default: return <Play className="w-5 h-5" />;
    }
  };

  const getShapeIcon = (shape) => {
    switch (shape.toLowerCase()) {
      case 'circle': return <Circle className="w-5 h-5" />;
      case 'triangle': return <Triangle className="w-5 h-5" />;
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
    let inBracket = false;
    let bracketContent = '';
    let bracketType = '';

    // Add support for [icon:shape] syntax
    const iconRegex = /\[icon:(.*?)\]/g;
    text = text.replace(iconRegex, (match, shape) => {
      if (currentText) parts.push({ type: 'text', content: currentText.trim() });
      currentText = '';
      parts.push({ type: 'icon', content: shape.trim() });
      return '';
    });

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      if (char === '(' || char === '[' || char === '<') {
        if (currentText) parts.push({ type: 'text', content: currentText.trim() });
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
    
    if (currentText) parts.push({ type: 'text', content: currentText.trim() });
    return parts;
  };

  return (
    <div className="my-1">
      <div className={`${blockStyles[type] || 'bg-gray-500'} rounded-lg p-3 text-white font-medium shadow flex items-center gap-2 flex-wrap`}>
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
            return <span key={idx} className="mx-1">{getShapeIcon(part.content)}</span>;
          }
          return <span key={idx}>{part.content}</span>;
        })}
      </div>
      {children && (
        <div className="ml-8 pl-4 border-l-2 border-gray-300">
          {children}
        </div>
      )}
    </div>
  );
};

const ScratchInstructions = ({ instructions }) => {
  const renderInstructions = (instr) => {
    if (typeof instr === 'string') {
      return <Block content={instr} type={getBlockType(instr)} />;
    }

    if (instr.type === 'repeat' || instr.type === 'if') {
      return (
        <Block content={instr.content} type="control">
          {instr.children.map((child, idx) => (
            <div key={idx}>{renderInstructions(child)}</div>
          ))}
        </Block>
      );
    }

    return <Block content={instr.content} type={instr.type} />;
  };

  const getBlockType = (content) => {
    if (content.includes('draw') || content.includes('move')) return 'motion';
    if (content.includes('set')) return 'variables';
    if (content.includes('if') || content.includes('repeat')) return 'control';
    if (content.includes('touching')) return 'events';
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
const App = () => {
  const defaultInstructions = [
    'set [base_size] to (50)',
    'set [shrink] to (0.7)',
    {
      type: 'repeat',
      content: 'if <touching (screen v)?> then',
      children: [
        {
          type: 'repeat',
          content: 'repeat (3)',
          children: [
            'draw [icon:circle] of size (base_size)',
            'move [icon:up] a bit',
            'set [base_size] to (base_size * shrink)'
          ]
        },
        'draw [icon:triangle] inside the top [icon:circle]',
        'add two small [icon:circle] for details',
        {
          type: 'repeat',
          content: 'repeat (3)',
          children: [
            'draw small [icon:circle] down the middle'
          ]
        }
      ]
    }
  ];

  return <ScratchInstructions instructions={defaultInstructions} />;
};

export default App;