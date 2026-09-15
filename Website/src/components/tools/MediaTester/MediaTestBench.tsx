import { SoundTestBench } from './SoundTestBench';
import { MicrophoneTestBench } from './MicrophoneTestBench';
import { WebcamTestBench } from './WebcamTestBench';
import { ControllerTestBench } from './ControllerTestBench';
import type { useMediaDiagnostics } from './useMediaDiagnostics';

export function MediaTestBench({ tool, diagnostics }: { tool: { slug: string }; diagnostics: ReturnType<typeof useMediaDiagnostics> }) {
  switch (tool.slug) {
    case 'sound-test': return <SoundTestBench diagnostics={diagnostics} />;
    case 'microphone-test': return <MicrophoneTestBench diagnostics={diagnostics} />;
    case 'webcam-test': return <WebcamTestBench diagnostics={diagnostics} />;
    case 'steering-wheel-tester':
    case 'gamepad-tester': return <ControllerTestBench tool={tool} diagnostics={diagnostics} />;
    default: return <p>Select a diagnostic from All Tools.</p>;
  }
}
