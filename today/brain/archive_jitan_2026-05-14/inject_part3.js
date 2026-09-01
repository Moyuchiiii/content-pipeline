(() => {
  const pm = document.querySelector('.tiptap.ProseMirror, .ProseMirror');
  const editor = pm.editor;
  
  // 空段落カウント (削除前)
  const beforePositions = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'paragraph' && node.textContent.trim() === '') {
      beforePositions.push({ pos, nodeSize: node.nodeSize });
    }
  });
  
  // 後ろから削除
  let tr = editor.state.tr;
  beforePositions.slice().reverse().forEach(({ pos, nodeSize }) => {
    tr = tr.delete(pos, pos + nodeSize);
  });
  if (beforePositions.length > 0) editor.view.dispatch(tr);
  
  // 削除後カウント
  let afterEmpty = 0;
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'paragraph' && node.textContent.trim() === '') {
      afterEmpty++;
    }
  });
  
  // 部分太字チェック
  const paragraphs = [...pm.querySelectorAll('p')];
  const partial = paragraphs.filter(p => {
    const s = p.querySelector('strong');
    return s && s.textContent.trim() !== p.textContent.trim();
  });
  
  return {
    step: 'verify_done',
    emptyDeleted: beforePositions.length,
    emptyRemaining: afterEmpty,
    partialBoldCount: partial.length,
    partialBoldExamples: partial.slice(0, 3).map(p => p.textContent.slice(0, 80)),
    finalDocSize: editor.state.doc.content.size,
    finalParaCount: pm.querySelectorAll('p').length,
    finalH2: pm.querySelectorAll('h2').length,
    finalH3: pm.querySelectorAll('h3').length,
    finalBlockquote: pm.querySelectorAll('blockquote').length,
    finalStrong: pm.querySelectorAll('strong').length,
    pass: partial.length === 0 && afterEmpty === 0
  };
})()