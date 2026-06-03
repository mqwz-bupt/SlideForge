import type { Project, RecentProject, Section, ChatMessage } from '../types/project'

export const mockSections: Section[] = [
  {
    id: 's1', order: 1, title: '引言：调制技术概述',
    points: [
      { id: 'p1', content: '调制技术在通信中的核心地位', type: 'bullet' },
      { id: 'p2', content: '模拟调制与数字调制的对比', type: 'bullet' },
      { id: 'p3', content: '研究背景与意义', type: 'bullet' }
    ]
  },
  {
    id: 's2', order: 2, title: '幅度调制 (AM)',
    points: [
      { id: 'p4', content: 'AM 调制原理与数学表达式', type: 'bullet' },
      { id: 'p5', content: '频谱分析与带宽计算', type: 'bullet' },
      { id: 'p6', content: '调幅系数对信号的影响', type: 'bullet' }
    ]
  },
  {
    id: 's3', order: 3, title: '频率调制 (FM)',
    points: [
      { id: 'p7', content: 'FM 调制原理与瞬时频率', type: 'bullet' },
      { id: 'p8', content: '窄带 FM 与宽带 FM', type: 'bullet' },
      { id: 'p9', content: 'Carson 带宽法则', type: 'bullet' },
      { id: 'p10', content: 'FM vs AM 抗噪声性能', type: 'bullet' }
    ]
  },
  {
    id: 's4', order: 4, title: '相位调制 (PM)',
    points: [
      { id: 'p11', content: 'PM 与 FM 的数学关系', type: 'bullet' },
      { id: 'p12', content: '相位偏移常数 β 的意义', type: 'bullet' }
    ]
  },
  {
    id: 's5', order: 5, title: '总结与展望',
    points: [
      { id: 'p13', content: '三种调制方式性能对比总结', type: 'bullet' },
      { id: 'p14', content: '向数字调制过渡的技术趋势', type: 'bullet' }
    ]
  }
]

export const mockProject: Project = {
  id: 'proj-1',
  name: '模拟调制系统分析',
  createdAt: '2026-04-14T10:00:00Z',
  updatedAt: '2026-04-14T15:30:00Z',
  documentOutline: {
    sections: mockSections,
    totalPoints: 14,
    estimatedMinutes: 10
  },
  style: 'bold-signal',
  slides: Array.from({ length: 15 }, (_, i) => ({
    id: `slide-${i + 1}`,
    order: i + 1,
    sectionId: mockSections[Math.min(Math.floor(i / 3), 4)].id,
    layout: (i === 0 ? 'title' : i % 4 === 0 ? 'two-column' : 'content') as any,
    content: {
      title: i === 0 ? '模拟调制系统分析' : mockSections[Math.min(Math.floor(i / 3), 4)].title,
      subtitle: i === 0 ? 'Amplitude · Frequency · Phase Modulation' : undefined,
      body: i > 0 ? mockSections[Math.min(Math.floor(i / 3), 4)].points.slice(0, 3).map(p => p.content) : undefined
    }
  })),
  sourceFiles: [
    { id: 'f1', name: '模拟调制系统分析.pdf', type: 'pdf', size: 2048000, uploadedAt: '2026-04-14T10:00:00Z' }
  ],
  metadata: {
    language: 'zh',
    mood: 'confident',
    scope: ['Core Concepts', 'Technical Analysis', 'Comparisons'],
    model: 'DeepSeek'
  }
}

export const mockRecentProjects: RecentProject[] = [
  { id: 'proj-1', name: '模拟调制系统分析', style: 'bold-signal', slideCount: 15, updatedAt: 'Today' },
  { id: 'proj-2', name: '深度学习综述报告', style: 'paper-ink', slideCount: 20, updatedAt: 'Yesterday' },
  { id: 'proj-3', name: '项目进度汇报 Q1', style: 'swiss-modern', slideCount: 12, updatedAt: '3 days ago' },
  { id: 'proj-4', name: '文艺复兴艺术与人文', style: 'vintage-editorial', slideCount: 18, updatedAt: 'Last week' },
  { id: 'proj-5', name: 'NLP 技术综述', style: 'neon-cyber', slideCount: 22, updatedAt: 'Last week' }
]

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg1', role: 'ai',
    content: 'Hi! I\'ve analyzed your document **"模拟调制系统分析"** and extracted **5 sections** with 16 key points. The outline is ready for your review.',
    timestamp: '10:05'
  },
  {
    id: 'msg2', role: 'user',
    content: 'Make it suitable for a 10-minute presentation',
    timestamp: '10:06'
  },
  {
    id: 'msg3', role: 'ai',
    content: 'Done! I\'ve restructured to fit **10 minutes**: reduced to 15 slides, merged PM into FM section, added summary comparison slide. The outline has been updated!',
    timestamp: '10:07'
  },
  {
    id: 'msg4', role: 'user',
    content: 'Change the first section to be more engaging',
    timestamp: '10:08'
  },
  {
    id: 'msg5', role: 'ai',
    content: 'I\'ve rewritten the introduction with a **hook question** and real-world example about radio broadcasting. Slides 1-2 updated.',
    timestamp: '10:09'
  }
]
