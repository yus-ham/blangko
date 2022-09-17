import HMR from '@roxi/routify/hmr';
import App from './App.svelte';

HMR(App, { target: document.body }, 'routify-app');
