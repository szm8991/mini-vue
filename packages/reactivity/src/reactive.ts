export function reactive(target: Object): Object {
  return new Proxy(target, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      if (typeof res === 'object') {
        return reactive(res);
      }
      return res;
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      return res;
    },
  });
}
