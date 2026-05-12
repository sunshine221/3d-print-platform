'use client';

import { Suspense, lazy } from 'react';

const Scene = lazy(() => import('./ModelViewerScene'));

interface Props {
  fileUrl: string | undefined;
}

export default function ModelViewer({ fileUrl }: Props) {
  if (!fileUrl) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        暂无 3D 模型
      </div>
    );
  }

  return (
    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            加载中...
          </div>
        }
      >
        <Scene fileUrl={fileUrl} />
      </Suspense>
    </div>
  );
}
