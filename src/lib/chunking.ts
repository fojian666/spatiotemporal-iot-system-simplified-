const domainTerms = [
  '土地利用',
  '总体规划',
  '耕地保护',
  '分级审批',
  '永久基本农田',
  '用途管制',
  '农用地',
  '建设用地',
  '用地预审',
  '选址意见书',
  '行政许可',
  '国土空间调查',
  '自然资源',
  '水资源',
];

export const splitTextIntoChunks = (content: string, maxLength = 240): string[] => {
  const paragraphs = content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  const flush = () => {
    if (current) chunks.push(current);
    current = '';
  };

  paragraphs.forEach((paragraph) => {
    if (paragraph.length > maxLength) {
      flush();
      for (let index = 0; index < paragraph.length; index += maxLength) {
        chunks.push(paragraph.slice(index, index + maxLength));
      }
      return;
    }
    if (current && current.length + paragraph.length + 2 > maxLength) flush();
    current = current ? `${current}\n\n${paragraph}` : paragraph;
  });
  flush();
  return chunks;
};

export const extractKeywords = (content: string) => domainTerms.filter((term) => content.includes(term));
