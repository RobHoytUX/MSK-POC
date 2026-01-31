import { WaveVisualization } from './components/WaveVisualization';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <div className="size-full">
      <WaveVisualization />
      <Toaster position="bottom-right" richColors />
    </div>
  );
}