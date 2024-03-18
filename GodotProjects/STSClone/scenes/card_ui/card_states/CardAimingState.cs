using Godot;
using System;

public partial class CardAimingState : CardState {
	int MOUSE_Y_SNAPBACK_THRESHOLD = 138;
	Events events;

	public override void Enter() {
		cardUI.GetNode<ColorRect>("Color").Color = new Color("Pink");
		cardUI.GetNode<Label>("State").Text = "AIMING";
		cardUI.targets.Clear();

		var offset = new Vector2(cardUI.parent.Size.X / 2, -cardUI.parent.Size.Y / 2);
		offset.X -= cardUI.Size.X / 2;
		cardUI.AnimateToPosition(cardUI.parent.GlobalPosition + offset, 0.2);
		cardUI.GetNode<Area2D>("DropPointDetector").Monitoring = false;
		events = GetNode<Events>("/root/Events");
		events.EmitSignal(nameof(events.CardAimStarted), cardUI);
	}

    public override void Exit() {
		events.EmitSignal(nameof(events.CardAimEnded), cardUI);
    }

    public override void OnInput(InputEvent @event) {
        var mouseMotion = @event is InputEventMouseMotion;
        var mouseAtBottom = cardUI.GetGlobalMousePosition().Y > MOUSE_Y_SNAPBACK_THRESHOLD;

		if (mouseMotion && mouseAtBottom) {
			EmitSignal(nameof(TransitionRequested), this, (int)CardState.State.BASE);
		} else if (@event.IsActionReleased("left_mouse") || @event.IsActionPressed("left_mouse")) {
			GetViewport().SetInputAsHandled();
			EmitSignal(nameof(TransitionRequested), this, (int)CardState.State.RELEASED);
		}
    }
}
