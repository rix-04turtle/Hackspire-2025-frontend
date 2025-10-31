import React from 'react'

/**
 * Simple Markdown to HTML renderer for chat messages
 * Handles common markdown syntax without external dependencies
 */
const MarkdownMessage = ({ content, className = '' }) => {
    const formatMarkdown = (text) => {
        if (!text) return []

        const lines = text.split('\n')
        const elements = []
        let listItems = []
        let codeBlock = null
        let isInCodeBlock = false

        const processInlineMarkdown = (line) => {
            // Bold: **text** or __text__
            line = line.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            line = line.replace(/__(.+?)__/g, '<strong class="font-semibold">$1</strong>')

            // Italic: *text* or _text_ (but not in the middle of words or URLs)
            line = line.replace(/(?<!\w)\*([^*\s]+(?:\s+[^*\s]+)*)\*/g, '<em class="italic">$1</em>')
            line = line.replace(/(?<!\w)_([^_\s]+(?:\s+[^_\s]+)*)_/g, '<em class="italic">$1</em>')

            // Inline code: `code`
            line = line.replace(/`(.+?)`/g, '<code class="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs font-mono border border-green-200">$1</code>')

            // Links: [text](url)
            line = line.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 hover:underline font-medium">$1</a>')

            return line
        }

        const flushListItems = () => {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`list-${elements.length}`} className="list-none space-y-1.5 my-2 ml-2">
                        {listItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span dangerouslySetInnerHTML={{ __html: item }} className="flex-1" />
                            </li>
                        ))}
                    </ul>
                )
                listItems = []
            }
        }

        lines.forEach((line, index) => {
            // Code blocks: ```
            if (line.trim().startsWith('```')) {
                if (isInCodeBlock) {
                    // End of code block
                    elements.push(
                        <pre key={`code-${elements.length}`} className="bg-gray-900 text-green-400 p-4 rounded-lg my-3 overflow-x-auto border border-gray-700">
                            <code className="text-sm font-mono">{codeBlock}</code>
                        </pre>
                    )
                    codeBlock = null
                    isInCodeBlock = false
                } else {
                    // Start of code block
                    flushListItems()
                    isInCodeBlock = true
                    codeBlock = ''
                }
                return
            }

            if (isInCodeBlock) {
                codeBlock += (codeBlock ? '\n' : '') + line
                return
            }

            // Headers
            if (line.startsWith('#### ')) {
                flushListItems()
                const text = processInlineMarkdown(line.substring(5))
                elements.push(
                    <h4 key={index} className="font-semibold text-sm text-gray-800 mt-3 mb-1" dangerouslySetInnerHTML={{ __html: text }} />
                )
            } else if (line.startsWith('### ')) {
                flushListItems()
                const text = processInlineMarkdown(line.substring(4))
                elements.push(
                    <h3 key={index} className="font-semibold text-base text-gray-800 mt-3 mb-2" dangerouslySetInnerHTML={{ __html: text }} />
                )
            } else if (line.startsWith('## ')) {
                flushListItems()
                const text = processInlineMarkdown(line.substring(3))
                elements.push(
                    <h2 key={index} className="font-bold text-lg text-gray-900 mt-4 mb-2 border-b border-gray-200 pb-1" dangerouslySetInnerHTML={{ __html: text }} />
                )
            } else if (line.startsWith('# ')) {
                flushListItems()
                const text = processInlineMarkdown(line.substring(2))
                elements.push(
                    <h1 key={index} className="font-bold text-xl text-gray-900 mt-4 mb-3 border-b-2 border-green-500 pb-2" dangerouslySetInnerHTML={{ __html: text }} />
                )
            }
            // Unordered lists: - or * or •
            else if (line.match(/^[\s]*[-*•]\s+/)) {
                const text = processInlineMarkdown(line.replace(/^[\s]*[-*•]\s+/, ''))
                listItems.push(text)
            }
            // Numbered lists: 1. 2. etc
            else if (line.match(/^[\s]*\d+\.\s+/)) {
                flushListItems()
                const text = processInlineMarkdown(line.replace(/^[\s]*\d+\.\s+/, ''))
                listItems.push(text)
            }
            // Blockquote: >
            else if (line.startsWith('> ')) {
                flushListItems()
                const text = processInlineMarkdown(line.substring(2))
                elements.push(
                    <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-700" dangerouslySetInnerHTML={{ __html: text }} />
                )
            }
            // Horizontal rule: --- or ***
            else if (line.match(/^(-{3,}|\*{3,})$/)) {
                flushListItems()
                elements.push(<hr key={index} className="my-3 border-gray-300" />)
            }
            // Empty line
            else if (line.trim() === '') {
                flushListItems()
                if (elements.length > 0 && elements[elements.length - 1]?.type !== 'br') {
                    elements.push(<br key={`br-${index}`} />)
                }
            }
            // Regular paragraph
            else {
                flushListItems()
                const text = processInlineMarkdown(line)
                elements.push(
                    <p key={index} className="my-1" dangerouslySetInnerHTML={{ __html: text }} />
                )
            }
        })

        // Flush any remaining list items
        flushListItems()

        return elements
    }

    return (
        <div className={`markdown-content ${className}`}>
            {formatMarkdown(content)}
        </div>
    )
}

export default MarkdownMessage
