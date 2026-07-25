function splitLineIntoSentencesPreservingSpacing(line) {
    if (!line) return [];
    const segments = [];
    const sentenceEndChars = '.!?。！？';
    let start = 0;

    for (let i = 0; i < line.length; i++) {
        if (!sentenceEndChars.includes(line[i])) continue;

        let end = i + 1;
        while (end < line.length && (line[end] === ' ' || line[end] === '\t')) {
            end++;
        }
        segments.push(line.slice(start, end));
        start = end;
    }

    if (start < line.length) {
        segments.push(line.slice(start));
    }

    return segments.length ? segments : [line];
}

function splitSentences(text) {
    if (!text) return [text];
    const segments = [];
    const lineBreakRegex = /(\r\n|\r|\n)/g;
    let lastIndex = 0;
    let match;

    while ((match = lineBreakRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            segments.push(...splitLineIntoSentencesPreservingSpacing(text.slice(lastIndex, match.index)));
        }
        segments.push(match[0]);
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        segments.push(...splitLineIntoSentencesPreservingSpacing(text.slice(lastIndex)));
    }

    return segments.length ? segments : [text];
}

function splitOversizedSegment(segment, maxLength) {
    if (!segment || segment.length <= maxLength) return [segment];
    const chunks = [];
    let start = 0;

    while (start < segment.length) {
        let end = Math.min(start + maxLength, segment.length);
        if (end < segment.length) {
            const spaceIndex = segment.lastIndexOf(' ', end);
            const tabIndex = segment.lastIndexOf('\t', end);
            const breakIndex = Math.max(spaceIndex, tabIndex);
            if (breakIndex > start + Math.floor(maxLength * 0.55)) {
                end = breakIndex + 1;
            }
        }
        chunks.push(segment.slice(start, end));
        start = end;
    }

    return chunks;
}

export function buildTranslationChunks(text, maxLength = 1800) {
    const segments = splitSentences(text).flatMap(segment => splitOversizedSegment(segment, maxLength));
    const chunks = [];
    let current = '';

    segments.forEach(segment => {
        if (!segment) return;
        if (current && current.length + segment.length > maxLength) {
            chunks.push(current);
            current = '';
        }
        current += segment;
    });

    if (current) {
        chunks.push(current);
    }

    return chunks.length ? chunks : [text];
}
