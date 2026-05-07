import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StateGallery } from './src/screens/states/StateGallery';
import { track } from './src/services/analytics';
import { getOrCreateUserId } from './src/services/userId';

export default function App() {
  useEffect(() => {
    getOrCreateUserId()
      .then(() => track('app_open'))
      .catch(() => {
        void track('app_open');
      });
  }, []);

  return (
    <>
      <StateGallery />
      <StatusBar style="dark" />
    </>
  );
}
