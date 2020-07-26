class method{

	int a = 1;
	int b = 1;
	static int c = 1;

	void method(){
		System.out.println("intance method");
		System.out.println("a="+a);

	}

	static void method2(){
		System.out.println("static method");
		System.out.println("c="+c);

	}
}

class power{

	public static void main(String[] args){

		method obj1=new method();
			obj1.a=0;
			obj1.method();
			

		//	method2();
			method.method2();
	}

}
