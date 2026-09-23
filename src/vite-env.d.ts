/// <reference types="vite/client" />

declare module 'motion/react' {
  export const motion: any;
  export const AnimatePresence: any;
  export const useMotionValue: any;
  export const useSpring: any;
}

declare module 'recharts' {
  export const ResponsiveContainer: any;
  export const AreaChart: any;
  export const Area: any;
  export const XAxis: any;
  export const YAxis: any;
  export const Tooltip: any;
  export const CartesianGrid: any;
  export const PieChart: any;
  export const Pie: any;
  export const Cell: any;
  export const BarChart: any;
  export const Bar: any;
}

declare module 'react-markdown' {
  const ReactMarkdown: any;
  export default ReactMarkdown;
}
