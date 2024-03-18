using Godot;
using System;
using System.Collections.Generic;
using System.Diagnostics;

// namespace myNamespace;
public partial class CardStateMachine : Node {
	
	[Export] public CardState initialState;

	private CardState _currentState;
	private Dictionary<int, CardState> _states;

	public void Init(CardUI card) {
		_states = new Dictionary<int, CardState>();
		foreach (Node child in GetChildren()) {
			if (child is CardState s) {
				_states[(int)s.state] = s;
				s.TransitionRequested += _OnTransitionRequested;
				s.cardUI = card;
			}

			initialState?.Enter();
			_currentState = initialState;
		}
	}

	public void OnInput (InputEvent @event) {
		_currentState?.OnInput(@event);
	}

	public void OnGuiInput (InputEvent @event) {
		_currentState?.OnGuiInput(@event);
	}

	public void OnMouseEntered() {
		_currentState?.OnMouseEntered();
	}
	
	public void OnMouseExited() {
		_currentState?.OnMouseExited();
	}

	public void _OnTransitionRequested(CardState from, int to) {
		if (from != _currentState) return;

		CardState newState = _states[to];
		if (newState is null) return;

		_currentState?.Exit();
		newState?.Enter();
		_currentState = newState;
	}
}
