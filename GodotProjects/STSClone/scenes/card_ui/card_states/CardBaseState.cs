using Godot;
using System;
using System.Diagnostics;
using System.Runtime.CompilerServices;
// using myNamespace;

public partial class CardBaseState : CardState {

	public override async void Enter() {
		if (cardUI.tween is not null && cardUI.tween.IsRunning()) cardUI.tween.Kill();

		if (!cardUI.IsNodeReady()) await ToSignal(cardUI, CardUI.SignalName.Ready);
		cardUI.EmitSignal(nameof(CardUI.ReparentRequest), cardUI);

		cardUI.GetNode<ColorRect>("Color").Color = new Color("Web Green");
		cardUI.GetNode<Label>("State").Text = "BASE";
		cardUI.PivotOffset = Vector2.Zero;
	}

	public override void OnGuiInput(InputEvent @event) {
		if (@event.IsActionPressed("left_mouse")) {
			cardUI.PivotOffset = cardUI.GetGlobalMousePosition() - cardUI.GlobalPosition;
			EmitSignal(nameof(TransitionRequested), this, (int)State.CLICKED);
		}
	}
}
