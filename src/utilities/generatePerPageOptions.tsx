/**
 * Generates an array of numbers for a "per page" selector.
 * Starts counting from 'step' and increments until it meets or exceeds the 'total'.
 * The last item is always 'total' itself (e.g., [5, 10, 15, 18]).
 * 
 * @param {number} total The total count of all items (e.g., 18).
 * @param {number} step The increment value (e.g., 5).
 * @returns {number[]} An array of per-page options.
 */
export const generatePerPageOptions = (total: number, step = 5) => {
  if (total <= 0) return [step];
  
  const options = [];
  let currentCount = step;

  while (currentCount < total) {
    options.push(currentCount);
    currentCount += step;
  }

  // Always include the exact total number as the final option
  if (options[options.length - 1] !== total) {
    options.push(total);
  }

  return options;
};

// Example Usage:
// generatePerPageOptions(18, 5) => [5, 10, 15, 18]
// generatePerPageOptions(25, 5) => [5, 10, 15, 20, 25]
// generatePerPageOptions(3, 5)  => [5] 
