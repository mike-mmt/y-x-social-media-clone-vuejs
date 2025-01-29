import {ref} from "vue";

export function useHover() {

  const isHovered = ref(false);

  const bind = {
    onMouseEnter: () => isHovered.value = true,
    onMouseLeave: () => isHovered.value = false,
  };

  return { isHovered, bind };
}