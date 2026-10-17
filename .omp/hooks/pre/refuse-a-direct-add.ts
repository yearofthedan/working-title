// Everything under .omp/hooks/pre is loaded as a hook, and a test file is not one, so
// the logic and its test sit in .omp/lib and this registers them.
export { default } from '../../lib/refuse-a-direct-add';
