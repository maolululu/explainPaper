export default function isDev() {
    return process.env.NODE_ENV === "production";
  }
  
  export const url = (path: string) => {
    // If path does not begin with a /, add one
    if (path[0] !== "/") {
      path = `/${path}`;
    }
    if (isDev()) {
      return `https://explain-paper.cn${path}`;
    }
    return `https://explain-paper.cn${path}`;
  };
  
