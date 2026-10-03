// Preserve paragraph separators verbatim and never split a UTF-16 surrogate pair.
export function buildTranslationChunks(text, maxLength = 1200) {
    if (!Number.isInteger(maxLength) || maxLength < 2) throw new RangeError('maxLength must be at least 2');
    const chunks = [];
    for (const line of String(text ?? '').split(/(\r\n|\r|\n)/)) {
        let start = 0;
        while (start < line.length) {
            let end = Math.min(start + maxLength, line.length);
            if (end < line.length) {
                const space = line.lastIndexOf(' ', end - 1);
                if (space > start + maxLength / 2) end = space + 1;
                if (/[\uD800-\uDBFF]/.test(line[end - 1]) && /[\uDC00-\uDFFF]/.test(line[end])) end--;
            }
            chunks.push(line.slice(start, end));
            start = end;
        }
    }
    return chunks;
}
