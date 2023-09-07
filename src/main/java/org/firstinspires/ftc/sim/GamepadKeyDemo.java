package org.firstinspires.ftc.sim;

import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import javax.swing.JFrame;

public class GamepadKeyDemo extends JFrame {

    public GamepadKeyDemo() {
        setSize(400, 300);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        
        addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                int keyCode = e.getKeyCode();
                System.out.println("Key Pressed: " + KeyEvent.getKeyText(keyCode));
                
                // Handle gamepad key press (you can map the key code to gamepad buttons)
            }

            @Override
            public void keyReleased(KeyEvent e) {
                int keyCode = e.getKeyCode();
                System.out.println("Key Released: " + KeyEvent.getKeyText(keyCode));
                
                // Handle gamepad key release (you can map the key code to gamepad buttons)
            }
        });
        
        setFocusable(true);
        requestFocus();
    }

    public static void main(String[] args) {
        GamepadKeyDemo demo = new GamepadKeyDemo();
        demo.setVisible(true);
    }
}
