"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Link,
  ImageIcon,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const toolbarButtons = [
    {
      icon: Bold,
      command: "bold",
      title: "Bold",
    },
    {
      icon: Italic,
      command: "italic",
      title: "Italic",
    },
    {
      icon: Underline,
      command: "underline",
      title: "Underline",
    },
    {
      icon: Highlighter,
      command: "hiliteColor",
      value: "#F59E0B",
      title: "Highlight",
      className: "text-amber-500",
    },
    {
      icon: List,
      command: "insertUnorderedList",
      title: "Bullet List",
    },
    {
      icon: ListOrdered,
      command: "insertOrderedList",
      title: "Numbered List",
    },
    {
      icon: Quote,
      command: "formatBlock",
      value: "blockquote",
      title: "Quote",
    },
    {
      icon: AlignLeft,
      command: "justifyLeft",
      title: "Align Left",
    },
    {
      icon: AlignCenter,
      command: "justifyCenter",
      title: "Align Center",
    },
    {
      icon: AlignRight,
      command: "justifyRight",
      title: "Align Right",
    },
  ]

  return (
    <div className={cn("border border-violet-200 dark:border-violet-800 rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-2 flex items-center space-x-1 flex-wrap">
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            type="button"
            size="sm"
            variant="ghost"
            className={cn("h-8 w-8 p-0 text-white hover:bg-white/20 transition-colors", button.className)}
            onClick={() => executeCommand(button.command, button.value)}
            title={button.title}
          >
            <button.icon className="w-4 h-4" />
          </Button>
        ))}

        <Separator orientation="vertical" className="h-6 bg-white/30 mx-2" />

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-white hover:bg-white/20 transition-colors"
          onClick={() => executeCommand("createLink", prompt("Enter URL:") || "")}
          title="Insert Link"
        >
          <Link className="w-4 h-4 mr-1" />
          <span className="text-xs">Link</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-white hover:bg-white/20 transition-colors"
          onClick={() => {
            const url = prompt("Enter image URL:")
            if (url) executeCommand("insertImage", url)
          }}
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4 mr-1" />
          <span className="text-xs">Image</span>
        </Button>

        <div className="ml-auto flex items-center space-x-2">
          <select
            className="bg-white/20 text-white text-xs rounded px-2 py-1 border-0 outline-none"
            onChange={(e) => executeCommand("formatBlock", e.target.value)}
          >
            <option value="div">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="p">Paragraph</option>
          </select>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 focus:outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
        onInput={handleInput}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        style={{
          lineHeight: "1.6",
        }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] blockquote {
          border-left: 4px solid #8b5cf6;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          background: #f8fafc;
        }
        [contenteditable] h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0;
          color: #8b5cf6;
        }
        [contenteditable] h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0;
          color: #8b5cf6;
        }
        [contenteditable] h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.5rem 0;
          color: #8b5cf6;
        }
        [contenteditable] ul,
        [contenteditable] ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        [contenteditable] li {
          margin: 0.25rem 0;
        }
        [contenteditable] a {
          color: #8b5cf6;
          text-decoration: underline;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
      `}</style>
    </div>
  )
}
