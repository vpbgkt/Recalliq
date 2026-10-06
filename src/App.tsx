import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ApplicationProvider, useAppContext } from './context/AppContext';
import { HomeScreen } from './components/HomeScreen/HomeScreen';
import { PracticeScreen } from './components/PracticeScreen/PracticeScreen';
import { ResultsScreen } from './components/ResultsScreen/ResultsScreen';

function AppRouter() {
  const { currentScreen } = useAppContext();
  if (currentScreen === 'practice') return <PracticeScreen />;
  if (currentScreen === 'results') return <ResultsScreen />;
  return <HomeScreen />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ApplicationProvider>
        <AppRouter />
      </ApplicationProvider>
    </ErrorBoundary>
  );
}