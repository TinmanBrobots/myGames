using Godot;
using System;

// namespace myNamespace;
public partial class CardState : Node {

	public enum State {BASE, CLICKED, DRAGGING, AIMING, RELEASED};

	[Signal] public delegate void TransitionRequestedEventHandler(CardState from, int to);
	
	[Export] public State state;

	public CardUI cardUI;

	public virtual void Enter() { }

	public virtual void Exit() { }

	public virtual void OnInput(InputEvent @event) { }

	public virtual void OnGuiInput(InputEvent @event) { }

	public virtual void OnMouseEntered() { }
	
	public virtual void OnMouseExited() { }
}
