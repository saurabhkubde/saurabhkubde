class man{
	int laptop = 1;
	int mob = 1;
	static int tv = 1;

	void kishanmethod(){
		System.out.println("laptop ="+laptop);
		System.out.println("mob ="+mob);
		System.out.println("tv ="+tv);
	}
	
	void saurbhm(){
		System.out.println("laptop ="+laptop);
		System.out.println("mob ="+mob);
		System.out.println("tv ="+tv);
	}

	public static void main(String[] args){

		man kishan=new man();
		kishan.tv=00000;
		kishan.laptop=0;
		kishan.kishanmethod();

		man sau =new man();
		sau.mob=999;
		sau.saurbhm();
	}

}
