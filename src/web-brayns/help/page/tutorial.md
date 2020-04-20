# Introduction to Web-Brayns

## Loading a Circuit

Click on the "Load a Model" button to open the file explorer.
Folders are shown on the left side, files on the right.

If the chosen file is a Circuit in a format supported by Brayns, it will show you this dialog.

There are several options:

* Let's start with the density.
    The density allows you to control the amount of cells that will be displayed, in percentage units.
    Circuits can have a very large number of cells.
    Brain tissue is very compact. If you load everything, the resulting image can be so dense that you won't be able to differentiate the neurons.
    Another issue will be the loading time. The more cells Brayns has to load, the more time it will take.
    As an example, for huge circuits (with hundred of thousands of neurons), the loading time can last hours.
    So, if you look at a circuit for the first time, it is better to load it with a very low density for a quick validation.
* A neuron consists of a cell body (the soma), dendrites and a single axon.
    You can choose to load the full morphology (that is all parts of the neuron), and that is what you will in most cases.
    But for huge ones, it is better to start by only loading the somas.
* We will come back to explain the reports and targets sections later.

Then click the "load" button and wait for the progress bar to complete.

The circuit will appears as a new model in the list you can see on the left.
In this list, you can

* show/hide a model...
* delete a model...
* focus on a model (by clicking the "aim" button)...
* and get more tools behind the "ellipsis" button (the three dots just here)...

[Watch the video](https://drive.google.com/file/d/1pV9LShAvb6O5vr1HKLh6UqsytcwoiuUm/view?usp=sharing)

## Moving the "camera" around

Brayns is a like a microscope with a tiny camera you can move around.

You have three possible moves:

1. __Zooming in and out__.
    You can use you mouse wheel, or the two fingers up and down gesture on Mac.
    If the speed is not enough, hold the Shift key.
    On the contrary, if you need to move slowly, hold the Ctrl key.
2. __Orbiting around the model center__.
    Just drag the mouse around, holding the left button.
    You will turn around the selected model.
    To select another model, just click on it in the models' list.
3. __Up, right, down and left translation__.
    Move the mouse accordingly, holding the right mouse button.
    If you have only one mouse button, hold the Ctrl key instead.

[Watch the video](https://drive.google.com/file/d/1NRFL9uk91nZp4y9Z_yo3ukqxIiyn-4PW/view?usp=sharing)

## Snapshot

You can get high quality snapshots by clicking the "camera" button.

You will have to define the size of the picture by getting a preset one or entering custom values.

As for the quality, you can set a custom number of samples.

__But what is a sample?__

In real life, when the light hits a rough surface, like plastic, clothes, etc...
an infinite number of light rays will bounce from this surface in a lot of different directions.
When one or many rays hit your eye, you perceive the color of the point you are looking at.

To generate an image, Brayns will cast a ray starting from the camera towards a pixel of your screen.
This ray will bounce on the models in the scene until it will reach a light source.
Each hit surface will absorb the light energy, leading to different colors and intensities.
This technique is called ray-tracing. It gives more realistic results because it mimics the path of a real light ray.

The only flaw comes when the ray hits a surface. If it is a perfect mirror, then we know exactly where it will bounce.
But for most of the existing surfaces, the ray becomes a cone after the bounce.
So, if you want to simulate this behavior, you need to recast an infinite number of rays which is impossible with a computer.

The trick is to select randomly a ray from the cone. And then render the image multiple times.
Each render is called a sample. And to get the final image, Brayns averages all the samples.

The more samples you use, the more realistic the render will be, but the more time the rendering will last.

50 samples will already give you nice results. Just increase the samples if you see some sparkles in the image.

When you click the "OK" button, a progress bar appears and after a while the browser will download the resulting PNG.

## Playing with targets

In a circuit, you can find targets. They are pre-defined sets of cells and you can use them to load only a part of the circuit.

To specify targets, click on the "Targets" button.
You can see two main columns in the dialog:

* On the left, there is the list of currently selected targets. If this list is empty, all the cells will be loaded.
* On the right, there is the list of available targets (excluding the ones that have already been added to the left column). Because this list can be huge, Brayns also provides a filtering box to quickly get the targets you are looking for.

If you click o a target from the available targets list this target will be move to the selected targets list.
And of course, clicking on a target from the selected targets list will move it back to the available targets list.

Click on Close or press Escape on your keyboard to get back to the circuit loader window.

Here is an example use case. Let's imagine you want to highlight the layers of a column.
One way to do that is to load the circuit with only the cells of layers 1, 3 and 5.
Then load the circuit again with only layers 2, 4, and 6.
On the screen, you will see exactly the same circuit that you would have seen by loading the whole circuit once.
But now, you have two distinct models, hence you can choose different colors for even layers and for odd layers.

## Loading a Simulation

The output of a simulation is stored in one or several reports. Each report contains the state of neurons over the simulated time.

From the circuit file, Brayns can find its associated reports. If any report is found, you will be able to select the one you want to load.

The rest of the options is the same as explained earlier in how to load a circuit.

There are two main differences between loading a circuit or a simulation:

The first one is that neurons are colored according to the report simulation values (for example, voltage range).

The second difference is that a navigation bar will appear at he bottom of the screen.

With this navigation bar, you can play or pause the animation.

You can also select the playback speed.

Like in most of the movie players you are used to, it's possible to view the simulation at a desired time by using the slider.

And more precise positioning, you can use the arrow buttons.
Single arrows for slow motion ... double arrows for fast motion.

Finally, you can enter a precise time by clicking here and using your keyboard.

[Watch the video](https://drive.google.com/file/d/1gDKbmFfGu0q51KWgqSjdOoMwzAJiiYHW/view?usp=sharing)