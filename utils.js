export const matchRoute = (pattern, path) => {
  // Remove trailing slashes for consistency
  const cleanPattern = pattern.replace(/\/$/, '');
  const cleanPath = path.replace(/\/$/, '');
  
  const patternParts = cleanPattern.split('/');
  const pathParts = cleanPath.split('/');
  
  if (patternParts.length !== pathParts.length) {
    
    return [false, {}];
  }
  
  const params = {};
  
  const match = patternParts.every((part, index) => {
    if (part.startsWith(':')) {
      // This is a parameter
      const paramName = part.slice(1);
      params[paramName] = pathParts[index];
      return true;
    }
    return part === pathParts[index];
  });
  
  return [match, params];
}