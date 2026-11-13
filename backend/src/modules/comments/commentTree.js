export async function deleteCommentsBottomUp(transaction, comments) {
  if (comments.length === 0) return;

  const ids = new Set(comments.map((comment) => comment.id));
  const childrenByParent = new Map();
  const roots = [];

  comments.forEach((comment) => {
    if (comment.parentId === null || !ids.has(comment.parentId)) {
      roots.push(comment.id);
      return;
    }

    const children = childrenByParent.get(comment.parentId) || [];
    children.push(comment.id);
    childrenByParent.set(comment.parentId, children);
  });

  const levels = [];
  let currentLevel = roots;
  let visited = 0;

  while (currentLevel.length > 0) {
    levels.push(currentLevel);
    visited += currentLevel.length;
    currentLevel = currentLevel.flatMap((id) => childrenByParent.get(id) || []);
  }

  if (visited !== comments.length) {
    throw new Error('Komentar memiliki struktur balasan yang tidak valid');
  }

  for (let index = levels.length - 1; index >= 0; index -= 1) {
    await transaction.comment.deleteMany({
      where: { id: { in: levels[index] } },
    });
  }
}
