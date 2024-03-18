using Godot;
using System;
// using myNamespace;

public partial class CardDraggingState : CardState {
	double DRAG_MIN_DURATION = 0.05;
	public Boolean min_duration_dragged = false;

    public override void Enter() {
		var UILayer = GetTree().GetFirstNodeInGroup("UILayer");
		if (UILayer is not null) {
			cardUI.Reparent(UILayer);
		}

		min_duration_dragged = false;
		var draggingTimer = GetTree().CreateTimer(DRAG_MIN_DURATION, false);
        draggingTimer.Timeout += () => min_duration_dragged = true;
        cardUI.GetNode<ColorRect>("Color").Color = new Color("Blue");
		cardUI.GetNode<Label>("State").Text = "DRAGGING";
    }

    public override void OnInput(InputEvent @event) {
		var singleTargeted = cardUI.card.IsSingleTargeted();
        var mouseMotion = @event is InputEventMouseMotion;
		var cancel = @event.IsActionPressed("right_mouse");
		var confirm = @event.IsActionReleased("left_mouse") || @event.IsActionPressed("left_mouse");

		if (singleTargeted && mouseMotion && cardUI.targets.Count > 0) {
			EmitSignal(nameof(TransitionRequested), this, (int)State.AIMING);
			return;
		}

		if (mouseMotion) {
			cardUI.GlobalPosition = cardUI.GetGlobalMousePosition() - cardUI.PivotOffset;
		}

		if (cancel) {
			EmitSignal(nameof(TransitionRequested), this, (int)State.BASE);
		} else if (min_duration_dragged && confirm) {
			GetViewport().SetInputAsHandled();
			EmitSignal(nameof(TransitionRequested), this, (int)State.RELEASED);
		}

    }
}
