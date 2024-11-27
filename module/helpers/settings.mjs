// not the greatest approach, but
export function objectsShallowEqual (obj1, obj2) {
  const entries1 = Object.entries(obj1)
  const entries2 = Object.entries(obj2)

  if (entries1.length !== entries2.length) {
    return false
  }

  for (let [key, value] of entries1) {
    if (obj2[key] !== value) {
      return false
    }
  }

  return true
}
