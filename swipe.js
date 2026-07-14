const ChoreySwipe = (() => {
  let openSwipeWrapper = null;

  function resetOpenRow() {
    openSwipeWrapper = null;
  }

  function enableAction(wrapper, { onAction }) {
    const card = wrapper.querySelector(".chore-item");
    const actionButton = wrapper.querySelector(".swipe-action-button");
    if (!card || !actionButton) return;

    const revealWidth = 88;
    const horizontalThreshold = 10;
    const directionBias = 1.18;
    const revealDelayMs = 140;
    let startX = 0;
    let startY = 0;
    let startingOffset = 0;
    let currentOffset = 0;
    let tracking = false;
    let gestureMode = "idle";
    let revealReady = false;
    let revealTimer = null;

    const clearRevealTimer = () => {
      if (revealTimer !== null) {
        window.clearTimeout(revealTimer);
        revealTimer = null;
      }
    };

    const setOffset = value => {
      currentOffset = Math.max(-revealWidth, Math.min(0, value));
      card.style.transform = `translateX(${currentOffset}px)`;
      const revealing = gestureMode === "horizontal" && revealReady && currentOffset < -4;
      wrapper.classList.toggle("swipe-revealing", revealing);
      wrapper.classList.toggle("swipe-open", currentOffset <= -revealWidth / 2);
    };

    const close = () => {
      clearRevealTimer();
      revealReady = false;
      gestureMode = "idle";
      setOffset(0);
      wrapper.classList.remove("swipe-revealing");
      if (openSwipeWrapper === wrapper) openSwipeWrapper = null;
    };

    const open = () => {
      clearRevealTimer();
      revealReady = true;
      if (openSwipeWrapper && openSwipeWrapper !== wrapper) openSwipeWrapper._closeSwipe?.();
      gestureMode = "idle";
      setOffset(-revealWidth);
      wrapper.classList.remove("swipe-revealing");
      wrapper.classList.add("swipe-open");
      openSwipeWrapper = wrapper;
    };

    wrapper._closeSwipe = close;

    card.addEventListener("pointerdown", event => {
      if (event.target.closest("input, button, a, [role=button]")) return;
      if (event.button !== undefined && event.button !== 0) return;
      if (openSwipeWrapper && openSwipeWrapper !== wrapper) openSwipeWrapper._closeSwipe?.();
      tracking = true;
      gestureMode = "undecided";
      startX = event.clientX;
      startY = event.clientY;
      startingOffset = wrapper.classList.contains("swipe-open") ? -revealWidth : 0;
    });

    card.addEventListener("pointermove", event => {
      if (!tracking) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (gestureMode === "undecided") {
        if (absX < horizontalThreshold && absY < horizontalThreshold) return;
        if (absY >= absX || absX < absY * directionBias) {
          gestureMode = "vertical";
          tracking = false;
          card.classList.remove("swiping");
          close();
          return;
        }

        gestureMode = "horizontal";
        card.classList.add("swiping");
        clearRevealTimer();
        revealReady = false;
        revealTimer = window.setTimeout(() => {
          revealTimer = null;
          if (tracking && gestureMode === "horizontal" && currentOffset < -4) {
            revealReady = true;
            wrapper.classList.add("swipe-revealing");
          }
        }, revealDelayMs);
        card.setPointerCapture?.(event.pointerId);
      }

      if (gestureMode !== "horizontal") return;
      if (!revealReady && absY > absX * 1.05) {
        tracking = false;
        card.classList.remove("swiping");
        close();
        return;
      }

      event.preventDefault();
      setOffset(startingOffset + dx);
    });

    let suppressClick = false;
    card.addEventListener("click", event => {
      if (suppressClick) {
        event.preventDefault();
        event.stopImmediatePropagation();
        suppressClick = false;
        return;
      }
      if (!wrapper.classList.contains("swipe-open")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      close();
    }, true);

    const finish = event => {
      if (!tracking && gestureMode !== "horizontal") return;
      tracking = false;
      card.classList.remove("swiping");
      if (gestureMode === "horizontal") {
        suppressClick = true;
        event.preventDefault();
        event.stopPropagation();
        currentOffset <= -revealWidth / 2 ? open() : close();
        window.setTimeout(() => { suppressClick = false; }, 350);
        return;
      }
      close();
    };

    card.addEventListener("pointerup", finish);
    card.addEventListener("pointercancel", () => {
      clearRevealTimer();
      tracking = false;
      card.classList.remove("swiping");
      close();
    });

    actionButton.addEventListener("click", async event => {
      event.stopPropagation();
      close();
      await onAction();
    });
  }

  return Object.freeze({ enableAction, resetOpenRow });
})();
