interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: JSX.Element[] = [];
    let inList = false;
    let tableRows: string[][] = [];
    let inTable = false;
    let tableHeaders: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(<ul key={`list-${elements.length}`} className="list-disc pl-6 mb-4 space-y-1">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0 && tableHeaders.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="my-8 overflow-x-auto shadow-md rounded-lg border border-border">
            <table className="min-w-full divide-y-2 divide-border">
              <thead className="bg-gradient-to-r from-primary/10 to-primary/5">
                <tr>
                  {tableHeaders.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-6 py-4 text-left text-sm font-bold text-foreground tracking-wide uppercase border-r border-border/30 last:border-r-0"
                      dangerouslySetInnerHTML={{ __html: header.trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                    />
                  ))}
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border/50">
                {tableRows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={`transition-colors hover:bg-muted/40 ${rowIdx % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
                  >
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-6 py-4 text-sm leading-relaxed border-r border-border/20 last:border-r-0"
                        dangerouslySetInnerHTML={{
                          __html: cell
                            .trim()
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                            .replace(/`(.*?)`/g, '<code class="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-mono">$1</code>')
                            .replace(/✅/g, '<span class="text-green-600 font-bold">✅</span>')
                            .replace(/❌/g, '<span class="text-red-600 font-bold">❌</span>')
                            .replace(/⚠️/g, '<span class="text-yellow-600 font-bold">⚠️</span>')
                        }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        tableHeaders = [];
        inTable = false;
      }
    };

    lines.forEach((line, i) => {
      // Detect table rows
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        flushList();

        // Skip separator line (|---|---|)
        if (line.includes('---') || line.includes('===')) {
          return;
        }

        const cells = line
          .split('|')
          .slice(1, -1) // Remove empty strings from start and end
          .map(cell => cell.trim());

        if (!inTable) {
          // First row is headers
          tableHeaders = cells;
          inTable = true;
        } else {
          // Data row
          tableRows.push(cells);
        }
        return;
      }

      // If we were in a table and encounter non-table line, flush the table
      if (inTable && !line.trim().startsWith('|')) {
        flushTable();
      }

      // Headers
      if (line.startsWith('# ')) {
        flushList();
        elements.push(<h1 key={i} className="text-3xl font-bold mt-8 mb-4 text-primary">{line.substring(2)}</h1>);
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(<h2 key={i} className="text-2xl font-semibold mt-6 mb-3 border-b pb-2">{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={i} className="text-xl font-semibold mt-5 mb-2">{line.substring(4)}</h3>);
      } else if (line.startsWith('#### ')) {
        flushList();
        elements.push(<h4 key={i} className="text-lg font-semibold mt-4 mb-2">{line.substring(5)}</h4>);
      }
      // Horizontal rule
      else if (line.trim() === '---') {
        flushList();
        elements.push(<hr key={i} className="my-6 border-t-2" />);
      }
      // Lists
      else if (line.trim().match(/^[-*]\s/)) {
        inList = true;
        const processedLine = line.trim().substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        listItems.push(<li key={i} dangerouslySetInnerHTML={{ __html: processedLine }} />);
      }
      // Numbered lists
      else if (line.trim().match(/^\d+\.\s/)) {
        flushList();
        const processedLine = line.trim().replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        elements.push(<li key={i} className="ml-6 mb-2" dangerouslySetInnerHTML={{ __html: `${processedLine}` }} />);
      }
      // Empty line
      else if (line.trim() === '') {
        flushList();
        elements.push(<div key={i} className="h-2" />);
      }
      // Normal paragraph
      else {
        if (inList && !line.trim().match(/^[-*]\s/)) {
          flushList();
        }
        const processedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');

        if (processedLine.trim()) {
          elements.push(<p key={i} className="mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: processedLine }} />);
        }
      }
    });

    flushTable();
    flushList();
    return elements;
  };

  return <div className="markdown-content">{parseMarkdown(content)}</div>;
};

export default MarkdownRenderer;
