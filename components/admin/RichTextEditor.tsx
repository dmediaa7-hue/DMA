import React, { useRef } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
};

const ToolbarButton: React.FC<{ cmd: string; value?: string; title: string; children: React.ReactNode }> = ({ cmd, value, title, children }) => (
    <button
        type="button"
        onMouseDown={e => e.preventDefault()}
        onClick={() => execCmd(cmd, value)}
        className="p-2 w-9 h-9 flex items-center justify-center font-serif rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        title={title}
    >
        {children}
    </button>
);

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        onChange(e.currentTarget.innerHTML);
    };

    return (
        <div className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800">
            <div className="flex flex-wrap items-center gap-1 p-1 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-t-md">
                <ToolbarButton cmd="bold" title="Bold"><b>B</b></ToolbarButton>
                <ToolbarButton cmd="italic" title="Italic"><i>I</i></ToolbarButton>
                <ToolbarButton cmd="underline" title="Underline"><u>U</u></ToolbarButton>
                <ToolbarButton cmd="strikeThrough" title="Strikethrough"><s>S</s></ToolbarButton>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>
                <ToolbarButton cmd="formatBlock" value="H2" title="Heading 2"><b>H2</b></ToolbarButton>
                <ToolbarButton cmd="formatBlock" value="H3" title="Heading 3"><b>H3</b></ToolbarButton>
                <ToolbarButton cmd="formatBlock" value="p" title="Paragraph">P</ToolbarButton>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>
                <ToolbarButton cmd="insertUnorderedList" title="Unordered List">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                </ToolbarButton>
                <ToolbarButton cmd="insertOrderedList" title="Ordered List">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
                </ToolbarButton>
                 <div className="w-px h-6 bg-gray-300 dark:bg-gray-500 mx-1"></div>
                <ToolbarButton cmd="justifyLeft" title="Align Left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="15" x2="3" y1="18" y2="18"/></svg>
                </ToolbarButton>
                <ToolbarButton cmd="justifyCenter" title="Align Center">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="19" x2="5" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>
                </ToolbarButton>
                <ToolbarButton cmd="justifyRight" title="Align Right">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>
                </ToolbarButton>
                <ToolbarButton cmd="justifyFull" title="Justify Full">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>
                </ToolbarButton>
            </div>
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                dangerouslySetInnerHTML={{ __html: value }}
                className="p-4 min-h-[250px] focus:outline-none prose dark:prose-invert max-w-none"
                style={{
                    // Custom prose-like styles for contentEditable
                    '--tw-prose-body': 'var(--tw-prose-pre-code)',
                    '--tw-prose-headings': 'var(--tw-prose-invert-headings)',
                    '--tw-prose-lead': 'var(--tw-prose-invert-lead)',
                    '--tw-prose-links': 'var(--tw-prose-invert-links)',
                    '--tw-prose-bold': 'var(--tw-prose-invert-bold)',
                } as React.CSSProperties}
            />
        </div>
    );
};

export default RichTextEditor;