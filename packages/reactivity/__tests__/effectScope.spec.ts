import { describe, expect, it, vi } from 'vitest'
import { EffectScope, computed, effect, effectScope, reactive } from '../src'

describe('effectScope', () => {
  it('should run', () => {
    const fnSpy = vi.fn(() => {})
    new EffectScope().run(fnSpy)
    expect(fnSpy).toHaveBeenCalledTimes(1)
  })

  it('should accept zero argument', () => {
    const scope = new EffectScope()
    expect(scope.effects.length).toBe(0)
  })

  it('should return run value', () => {
    expect(new EffectScope().run(() => 1)).toBe(1)
  })

  it('should collect the effects', () => {
    const scope = new EffectScope()
    scope.run(() => {
      let dummy
      const counter = reactive({ num: 0 })
      effect(() => (dummy = counter.num))

      expect(dummy).toBe(0)
      counter.num = 7
      expect(dummy).toBe(7)
    })

    expect(scope.effects.length).toBe(1)
  })
  it('stop', () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })
    const scope = new EffectScope()
    scope.run(() => {
      effect(() => (dummy = counter.num))
      effect(() => (doubled = counter.num * 2))
    })
    expect(scope.effects.length).toBe(2)
    expect(dummy).toBe(0)
    counter.num = 7
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)
    scope.stop()
    counter.num = 6
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)
  })
  it('should collect nested scope', () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })

    const scope = new EffectScope()
    scope.run(() => {
      effect(() => (dummy = counter.num))
      // nested scope
      new EffectScope().run(() => {
        effect(() => (doubled = counter.num * 2))
      })
    })

    expect(scope.effects.length).toBe(1)
    expect(scope.scopes!.length).toBe(1)
    expect(scope.scopes![0]).toBeInstanceOf(EffectScope)

    expect(dummy).toBe(0)
    counter.num = 7
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)

    // stop the nested scope as well
    scope.stop()

    counter.num = 6
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)
  })

  it('able to run the scope', () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })

    const scope = new EffectScope()
    scope.run(() => {
      effect(() => (dummy = counter.num))
    })

    expect(scope.effects.length).toBe(1)

    scope.run(() => {
      effect(() => (doubled = counter.num * 2))
    })

    expect(scope.effects.length).toBe(2)

    counter.num = 7
    expect(dummy).toBe(7)
    expect(doubled).toBe(14)

    scope.stop()
  })
  it('can not run an inactive scope', () => {
    let dummy, doubled
    const counter = reactive({ num: 0 })

    const scope = new EffectScope()
    scope.run(() => {
      effect(() => (dummy = counter.num))
    })

    expect(scope.effects.length).toBe(1)

    scope.stop()

    scope.run(() => {
      effect(() => (doubled = counter.num * 2))
    })

    expect(scope.effects.length).toBe(1)

    counter.num = 7
    expect(dummy).toBe(0)
    expect(doubled).toBe(undefined)
  })

  it('effectScope使用', () => {
    const data = reactive({ num: 1 })
    const scope = effectScope()
    let num
    scope.run(() => {
      effect(() => (num = data.num))
    })
    expect(num).toBe(1)
    data.num++
    expect(num).toBe(2)
    scope.stop()
    data.num++
    expect(num).toBe(2)
  })
  it('effectScope + computed', () => {
    const data = reactive({ num: 1 })
    const scope = effectScope()
    let double
    scope.run(() => {
      double = computed(() => data.num * 2)
    })
    expect(double.value).toBe(2)
    data.num++
    expect(double.value).toBe(4)
    scope.stop()
    data.num++
    expect(double.value).toBe(4)
  })

  it('effectScope嵌套', () => {
    const data = reactive({ num: 1 })
    let double, triple, fourble
    const scope1 = effectScope()
    let scope2
    let scope3
    scope1.run(() => {
      effect(() => {
        double = data.num * 2
      })
      scope2 = effectScope()
      scope2.run(() => {
        effect(() => {
          triple = data.num * 3
        })
        scope3 = effectScope()
        scope3.run(() => {
          effect(() => {
            fourble = data.num * 4
          })
        })
      })
    })
    expect(double).toBe(2)
    expect(triple).toBe(3)
    expect(fourble).toBe(4)

    data.num++ // 2
    expect(double).toBe(4)
    expect(triple).toBe(6)
    expect(fourble).toBe(8)

    scope3.stop() // 最里层的终止了
    data.num++ // 3
    expect(double).toBe(6)
    expect(triple).toBe(9)
    expect(fourble).toBe(8)

    scope1.stop() // 最外层的stop了，scope2也要终止
    data.num++
    expect(double).toBe(6)
    expect(triple).toBe(9)
    expect(fourble).toBe(8)
  })
})
