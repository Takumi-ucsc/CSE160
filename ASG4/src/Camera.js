class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 2]);
        this.at = new Vector3([0, 0, 0]);
        this.up = new Vector3([0, 1, 0]);

        this.viewMat = new Matrix4();
        this.projMat = new Matrix4();
        this.projMat.setPerspective(90, 400 / 400, .1, 1000);

        this.updateViewMat();
    }

    updateViewMat() {
        this.viewMat.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    setViewMat() {
        this.updateViewMat();
    }

    // W key 
    moveForward(speed) {
        let forward = new Vector3();
        forward.set(this.at);
        forward.sub(this.eye);
        forward.normalize();
        // scale
        forward.mul(speed);
        this.eye.add(forward);
        this.at.add(forward);
    }

    // S key
    moveBackward(speed) {
        let back = new Vector3();
        back.set(this.eye);
        back.sub(this.at);
        back.normalize();
        // scale
        back.mul(speed);
        this.eye.add(back);
        this.at.add(back);
    }

    // A key
    moveLeft(speed) {
        let left = new Vector3();
        left.set(this.at);
        left.sub(this.eye);
        let s = new Vector3();
        s = Vector3.cross(this.up, left);
        s.normalize();
        // scale
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
    }

    // D key
    moveRight(speed) {
        let right = new Vector3();
        right.set(this.at);
        right.sub(this.eye);
        let s = new Vector3();
        s = Vector3.cross(right, this.up);
        s.normalize();
        // scale
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
    }

    pan(degree) {
        let pan = new Vector3();
        pan.set(this.at);
        pan.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-degree, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var fprime = rotationMatrix.multiplyVector3(pan);
        this.at.set(this.eye);
        this.at.add(fprime);
    }

    // Q key
    panLeft(degree) {
        let panLeft = new Vector3();
        panLeft.set(this.at);
        panLeft.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(degree, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var fprime = rotationMatrix.multiplyVector3(panLeft);
        this.at.set(this.eye);
        this.at.add(fprime);
    }

    // E key
    panRight(degree) {
        let panRight = new Vector3();
        panRight.set(this.at);
        panRight.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-degree, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var fprime = rotationMatrix.multiplyVector3(panRight);
        this.at.set(this.eye);
        this.at.add(fprime);
    }

    panUp(degree) {
        const f = new Vector3(this.at.elements).sub(this.eye);
        const s = Vector3.cross(f, this.up).normalize();
        const rot = new Matrix4().setRotate(degree, ...s.elements);
        const fPrime = rot.multiplyVector3(f);
        this.at.set(this.eye).add(fPrime);
    }
}