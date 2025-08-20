declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.webp' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.png'  { const v: import('react-native').ImageSourcePropType; export default v; }
declare module '*.jpg'  { const v: import('react-native').ImageSourcePropType; export default v; }
declare module '*.jpeg' { const v: import('react-native').ImageSourcePropType; export default v; }
declare module '*.gif'  { const v: import('react-native').ImageSourcePropType; export default v; }
declare module '*.webp' { const v: import('react-native').ImageSourcePropType; export default v; }
