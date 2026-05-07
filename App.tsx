import { StatusBar } from 'expo-status-bar';
import { EmptyDiaryScreen } from './src/screens/EmptyDiaryScreen';

export default function App() {
  return (
    <>
      <EmptyDiaryScreen />
      <StatusBar style="dark" />
    </>
  );
}
