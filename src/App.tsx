/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NovelProvider, useNovel } from './context/NovelContext';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { EditorView } from './components/views/EditorView';
import { WorldBibleView } from './components/views/WorldBibleView';
import { BookPreviewView } from './components/views/BookPreviewView';
import { PublishingView } from './components/views/PublishingView';
import { ProjectsView } from './components/views/ProjectsView';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { ToastContainer } from './components/common/ToastContainer';
import { ConfirmDialog } from './components/common/ConfirmDialog';

const MainWorkbench: React.FC = () => {
  const { activeTab, isZenMode } = useNovel();

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] flex flex-col font-sans transition-colors">
      <Navbar />
      <ToastContainer />
      <ConfirmDialog />
      <OfflineIndicator />

      <div className="flex-1">
        {activeTab === 'editor' && <EditorView />}
        {activeTab === 'bible' && <WorldBibleView />}
        {activeTab === 'preview' && <BookPreviewView />}
        {activeTab === 'publish' && <PublishingView />}
        {activeTab === 'projects' && <ProjectsView />}
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <NovelProvider>
      <MainWorkbench />
    </NovelProvider>
  );
}
