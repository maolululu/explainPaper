export default function isDev() {
    return process.env.NODE_ENV === "development";
  }
  
  export const url = (path: string) => {
    // If path does not begin with a /, add one
    if (path[0] !== "/") {
      path = `/${path}`;
    }
    if (isDev()) {
      return `http://localhost:3000${path}`;
    }
    return `https://www.explainpaper.com${path}`;
  };
  