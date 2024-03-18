using Godot;
using System;
// using myNamespace;

public partial class CardClickedState : CardState {

	public override void Enter() {
		cardUI.GetNode<ColorRect>("Color").Color = new Color("Red");
		cardUI.GetNode<Label>("State").Text = "CLICKED";
		cardUI.GetNode<Area2D>("DropPointDetector").Monitoring = true;
	}

	public override void OnInput(InputEvent @event) {
		if (@event is InputEventMouseMotion) {
			EmitSignal(nameof(TransitionRequested), this, (int)State.DRAGGING);
		}
	}
}
