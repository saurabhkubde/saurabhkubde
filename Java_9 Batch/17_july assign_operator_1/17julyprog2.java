class operator {
	int a = 50,b = 20 ;

	void add(){
		System.out.println("Addition="+(a + b));
	}
	
	void sub(){
		System.out.println("Subtraction="+(a - b));
	}
	
	void mul(){
		System.out.println("Multiplication="+(a * b));
	}

	void div(){
		System.out.println("Division="+(a / b));
	}

	void mod(){
		System.out.println("Modulas="+(a % b));
	}

	public static void main(String[] args) {
		operator obj=new operator();
		obj.add();
		obj.sub();
		obj.mul();
		obj.div();
		obj.mod();
	}


}
