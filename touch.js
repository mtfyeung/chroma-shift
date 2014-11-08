var multiplier = 0;
var curr_touch;
var begin_touch;

function get_curr_multiplier()
{
    if (curr_touch == null)
    {
        return multiplier;
    }

    var ret = multiplier + (begin_touch.pageY - curr_touch.pageY) / 100;

    return Math.max(0, ret);
}

function init_touch(el)
{
    el.addEventListener("touchstart", handleStart, false);
    el.addEventListener("touchend", handleEnd, false);
    el.addEventListener("touchcancel", handleEnd, false);
    el.addEventListener("touchleave", handleEnd, false);
    el.addEventListener("touchmove", handleMove, false);
}

function handleStart(evt) {
  evt.preventDefault();
  var touches = evt.changedTouches;

  if (touches.length > 1)
  {
    return;
  }

  if (begin_touch == null)
  {
    begin_touch = curr_touch = touches[0];
  }
}

function handleMove(evt) {
  evt.preventDefault();
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++)
  {
    var touch = touches[i];

    if (touch.identifier === begin_touch.identifier)
    {
        curr_touch = touch;
        break;
    }
  }
}

function handleEnd(evt) {
  evt.preventDefault();
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++)
  {
    var touch = touches[i];

    if (touch.identifier === begin_touch.identifier)
    {
        multiplier = get_curr_multiplier();

        begin_touch = curr_touch = null;
        break;
    }
  }
}