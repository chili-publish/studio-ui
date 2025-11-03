import { Variable } from '@chili-publish/studio-sdk';

export type GroupVariable = Variable & { children?: Variable[] };
