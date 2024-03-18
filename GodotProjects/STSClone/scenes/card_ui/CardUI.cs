using Godot;
using System;
using System.Collections.Generic;
using System.Diagnostics;

// namespace myNamespace;
public partial class CardUI : Control {
	
	[Signal] public delegate void ReparentRequestEventHandler(CardUI whichCardUI);
	[Export] public Card card;
	public List<Node> targets = new List<Node> {};

	public Control parent;
	public Tween tween;

	// Called when the node enters the scene tree for the first time.
	public override void _Ready() {
		var color = GetNode<ColorRect>("Color");
		var state = GetNode<Label>("State");
		var dropPointDetector = GetNode<Area2D>("DropPointDetector");

		var cardStateMachine = GetNode<CardStateMachine>("CardStateMachine");
		cardStateMachine.Init(this);
	}

    public override void _Input(InputEvent @event) {
		var cardStateMachine = GetNode<CardStateMachine>("CardStateMachine");
		cardStateMachine.OnInput(@event);
    }

    public void _OnGuiInput(InputEvent @event) {
		var cardStateMachine = GetNode<CardStateMachine>("CardStateMachine");
		cardStateMachine.OnGuiInput(@event);
    }

	public void _OnMouseEntered() {
		var cardStateMachine = GetNode<CardStateMachine>("CardStateMachine");
		cardStateMachine.OnMouseEntered();
	}

	public void _OnMouseExited() {
		var cardStateMachine = GetNode<CardStateMachine>("CardStateMachine");
		cardStateMachine.OnMouseExited();
	}

	public void _OnDropPointAreaEntered(Area2D area) {
		if (!targets.Contains(area)) {
			targets.Add(area);
		}
	}

	public void _OnDropPointAreaExited(Area2D area) {
		targets.Remove(area);
	}

	public void AnimateToPosition(Vector2 newPosition, double duration) {
		tween = CreateTween().SetTrans(Tween.TransitionType.Circ).SetEase(Tween.EaseType.Out);
		tween.TweenProperty(this, "global_position", newPosition, duration);
	}
}
