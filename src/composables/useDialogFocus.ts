import { nextTick, onBeforeUnmount, type Ref, watch } from 'vue'

const focusableSelector =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useDialogFocus(
  active: Readonly<Ref<boolean>>,
  container: Ref<HTMLElement | undefined>,
  close: () => void,
): void {
  let returnFocus: HTMLElement | null = null

  function keydown(event: KeyboardEvent): void {
    if (!active.value) return
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key !== 'Tab' || !container.value) return
    const focusable = [...container.value.querySelectorAll<HTMLElement>(focusableSelector)]
    if (!focusable.length) return
    const first = focusable[0]!
    const last = focusable.at(-1)!
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  watch(active, async (isActive) => {
    if (isActive) {
      returnFocus = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', keydown)
      await nextTick()
      container.value?.querySelector<HTMLElement>(focusableSelector)?.focus()
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', keydown)
      returnFocus?.focus()
      returnFocus = null
    }
  })

  onBeforeUnmount(() => {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', keydown)
  })
}
