using Godot;
using System;

public partial class Hand : HBoxContainer {
	// Called when the node enters the scene tree for the first time.
	public override void _Ready() {
		foreach (Node child in GetChildren()) {
			if (child is CardUI cardUI) {
				cardUI.parent = this;
				cardUI.ReparentRequest += _OnCardUIReparentRequest;
			}
		}
	}

	public void _OnCardUIReparentRequest(CardUI child) {
		child.Reparent(this);
	}
}
